import fs from 'node:fs';

export function validateIssue(issue) {
  if (!issue?.meta?.publisher || typeof issue.meta.issueNumber !== 'string' ||
      typeof issue.meta.publishDate !== 'string' || !Array.isArray(issue.articles) ||
      issue.articles.length !== 14 || !Array.isArray(issue.pages) || issue.pages.length !== 50 ||
      !Array.isArray(issue.youtubeTopClips) || !Array.isArray(issue.sectionPlan) || !issue.infographics) {
    throw Object.assign(new Error('올바른 50페이지·14개 꼭지 데이터가 필요합니다.'), { statusCode: 400 });
  }
  if (issue.pages.some((p, i) => p.pageNumber !== i + 1) ||
      issue.articles.some(a => !a.id || typeof a.title !== 'string' || !Array.isArray(a.bodyParagraphs))) {
    throw Object.assign(new Error('기사 또는 페이지 구조가 올바르지 않습니다.'), { statusCode: 400 });
  }
}

// 기존 지면에 복사된 편집 필드를 함께 갱신하되 독립적인 후속 지면 제목은 보존한다.
export function synchronizePages(previous, next) {
  for (const article of next.articles) {
    const old = previous.articles.find(a => a.id === article.id);
    if (!old) continue;
    for (const page of next.pages) {
      if (page.pageNumber < article.startPage || page.pageNumber > article.endPage) continue;
      for (const field of ['title', 'subtitle', 'lead']) {
        if (page[field] === old[field]) page[field] = article[field];
      }
      if (Array.isArray(page.paragraphs)) {
        page.paragraphs = page.paragraphs.map(p => p === old.lead ? article.lead : p);
      }
      if (page.qrUrl === old.sourceUrl) page.qrUrl = article.sourceUrl;
    }
  }
}

export function writeIssueAtomic(file, issue) {
  const temp = `${file}.tmp`;
  try {
    fs.writeFileSync(temp, JSON.stringify(issue, null, 2), 'utf8');
    fs.renameSync(temp, file);
  } finally {
    fs.rmSync(temp, { force: true });
  }
}
