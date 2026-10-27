"""Local speech recognition. Output is evidence to review, never an approved quotation."""
import argparse, json, os, sys
from pathlib import Path
from faster_whisper import WhisperModel

def transcribe(audio, model_name='medium', device='cpu', allow_download=False):
    model=WhisperModel(model_name,device=device,compute_type='int8' if device=='cpu' else 'float16',local_files_only=not allow_download)
    segments,info=model.transcribe(str(audio),language='ko',beam_size=5,vad_filter=True,condition_on_previous_text=False)
    result=[]
    for segment in segments:
        text=segment.text.strip()
        if text:
            result.append({'start':round(segment.start,2),'end':round(segment.end,2),'text':text,'avgLogprob':segment.avg_logprob,'noSpeechProbability':segment.no_speech_prob})
    if not result: raise ValueError('인식된 한국어 발언이 없습니다. 원음을 확인하세요.')
    return {'segments':result,'transcription':{'engine':'faster-whisper','model':model_name,'language':info.language,'device':device,'reviewStatus':'unreviewed','speakerLabelsVerified':False,'visualContextReviewed':False}}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('audio',type=Path);parser.add_argument('--output',required=True,type=Path)
    parser.add_argument('--model',default=os.environ.get('SPEAKS_WHISPER_MODEL','medium'));parser.add_argument('--device',default=os.environ.get('SPEAKS_WHISPER_DEVICE','cpu'));parser.add_argument('--allow-download',action='store_true')
    args=parser.parse_args()
    try:
        result=transcribe(args.audio,args.model,args.device,args.allow_download)
        args.output.write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8')
        print(json.dumps({'segments':len(result['segments']),'reviewStatus':'unreviewed'}))
    except Exception as error:
        print('음성 전사 실패: '+str(error),file=sys.stderr);sys.exit(1)
