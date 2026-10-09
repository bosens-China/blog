from collections import Counter

from schemas import Article

# 主题画像取前 N 个高频标签
PROFILE_SIZE = 12
# 新旧画像相似度不低于该值时，认为博客主题方向没有明显变化
MIN_PROFILE_SIMILARITY = 0.6


def rank_tags(articles: list[Article]) -> list[str]:
    """按出现频次对文章关键词排序；同频按字典序，保证结果稳定"""
    counter: Counter[str] = Counter()
    for a in articles:
        if a.seo and a.seo.keywords:
            counter.update(a.seo.keywords)

    ranked = sorted(counter.items(), key=lambda item: (-item[1], item[0]))
    return [tag for tag, _ in ranked]


def profile_similarity(current: list[str], previous: list[str]) -> float:
    """计算两份主题画像的 Jaccard 相似度"""
    current_set, previous_set = set(current), set(previous)
    union = current_set | previous_set
    if not union:
        return 1.0
    return len(current_set & previous_set) / len(union)


def is_profile_stable(current: list[str], previous: list[str]) -> bool:
    return profile_similarity(current, previous) >= MIN_PROFILE_SIMILARITY
