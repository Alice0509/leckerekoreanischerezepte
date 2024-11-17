// lib/geocode.js
import axios from 'axios';

/**
 * Google Maps Geocoding API를 사용한 역지오코딩 함수
 * @param {number} lat - 위도
 * @param {number} lon - 경도
 * @returns {string} - 주소 문자열
 */
export const reverseGeocode = async (lat, lon) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY_SERVER; // 서버 전용 API 키 사용
  if (!apiKey) {
    throw new Error('Google Maps API 키가 설정되지 않았습니다.');
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const { results, status } = response.data;

    if (status !== 'OK') {
      throw new Error(`Geocoding API 오류: ${status}`);
    }

    if (results && results.length > 0) {
      return results[0].formatted_address;
    } else {
      return 'Address not found';
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Unable to determine address';
  }
};
