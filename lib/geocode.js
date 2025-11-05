// lib/geocode.js
import axios from 'axios';

/**
 * Google Maps Geocoding API를 사용한 역지오코딩 함수
 * @param {number} lat - 위도
 * @param {number} lon - 경도
 * @returns {string|null} - 주소 문자열, 실패 시 null
 */
export const reverseGeocode = async (lat, lon) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY_SERVER; // 서버 전용 API 키
  if (!apiKey) {
    console.warn('Google Maps API 키가 설정되지 않았습니다.');
    return null;
  }

  // ⚠️ 백틱(`)과 ${} 포함
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;

  try {
    const { data } = await axios.get(url);
    const { results, status } = data;

    if (status !== 'OK') {
      console.warn(`Geocoding API returned non-OK status: ${status}`);
      return null;
    }

    return results && results.length > 0 ? results[0].formatted_address : null;
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    return null;
  }
};
