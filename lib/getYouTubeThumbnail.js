// lib/getYouTubeThumbnail.js

/**
 * 유튜브 URL에서 비디오 ID를 추출하고 썸네일 URL을 반환합니다.
 * @param {string} url - 유튜브 비디오 URL
 * @returns {string|null} - 썸네일 URL 또는 null
 */
export const getYouTubeThumbnail = (url) => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([^\s&]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return null;
};
