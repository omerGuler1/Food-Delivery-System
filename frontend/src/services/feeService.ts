import axiosInstance from './axiosConfig';

export interface FeeDTO {
  id: number;
  fee: number;
}

export const getDeliveryFee = async (): Promise<FeeDTO> => {
  const response = await axiosInstance.get('/fees/delivery');
  return response.data;
};

export const updateDeliveryFee = async (value: number): Promise<FeeDTO> => {
  const response = await axiosInstance.put('/fees/delivery', { value });
  return response.data;
}; 