import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;
axios.defaults.timeout = 15000;

// Helper function to get headers for authenticated requests (using cookies)
const getAuthHeaders = () => {
  return {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  };
};

export const authAPI = {
  login: (credentials) => axios.post(`${BASE_URL}/auth/login`, credentials),
  register: (userData) => axios.post(`${BASE_URL}/auth/register`, userData),
  logout: () => axios.post(`${BASE_URL}/auth/logout`),
  status: () => axios.get(`${BASE_URL}/auth/status`),
};

export const auctionAPI = {
  getAllAuctions: () => axios.get(`${BASE_URL}/auctions`),
  getAuction: (roomId) => axios.get(`${BASE_URL}/auction/${roomId}`),
  createAuction: (formData) => {
    return axios.post(`${BASE_URL}/auction/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  endAuction: (roomId) => axios.post(`${BASE_URL}/auction/${roomId}/end`),
  deleteAuction: (roomId) => axios.delete(`${BASE_URL}/auction/${roomId}`),
  getBidHistory: (roomId) => axios.get(`${BASE_URL}/auction/${roomId}/bids`),
  quitAuction: (roomId) => axios.post(`${BASE_URL}/auction/${roomId}/quit`),
};

export const userAPI = {
  getProfile: () => axios.get(`${BASE_URL}/profile`),
  getMyAuctions: () => axios.get(`${BASE_URL}/users/my-auctions`),
  getJoinedAuctions: () => axios.get(`${BASE_URL}/users/joined-auctions`),
  getMyBids: () => axios.get(`${BASE_URL}/users/my-bids`),
  getWonAuctions: () => axios.get(`${BASE_URL}/users/won-auctions`),
};
