import api from './config';

export const recommendationsAPI = {
  // Get service recommendations for a vehicle
  getByVehicle: async (vehicleId) => {
    const response = await api.get(`/recommendations/vehicle/${vehicleId}`);
    return response.data;
  },
};

