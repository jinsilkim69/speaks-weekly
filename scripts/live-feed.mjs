export function feedFromIssue(issue) {
  return {
    mode:'collected',
    updatedAt:issue.meta.compiledAt,
    channel:'@SPEAKS_TV',
    items:(issue.sources || []).map(source => ({
      id:source.id, videoId:source.id, videoUrl:source.url, thumbnail:source.thumbnail,
      title:issue.articles.find(a => a.sourceId === source.id)?.title || source.title,
      program:'분석에 사용한 실제 방송', speaker:'스픽스 방송', isLive:false,
      timeAgo:`방송일 ${source.uploadDate}`,
      views:source.views == null ? '조회수 미확인' : `수집 시 조회수 ${source.views.toLocaleString()}회`,
      summary:'한국어 자막을 분석해 기사화했습니다. 현재 실시간 방송 상태를 표시하는 목록은 아닙니다.'
    }))
  };
}
