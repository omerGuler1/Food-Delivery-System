import axiosInstance from './axiosConfig';

export interface FeeDTO {
  id: number;
  fee: number;
}

// Varsayılan teslimat ücreti
const DEFAULT_DELIVERY_FEE = 15;

export const getDeliveryFee = async (): Promise<FeeDTO> => {
  try {
    const response = await axiosInstance.get('/fees/delivery');
    return response.data;
  } catch (error) {
    console.error('Error fetching delivery fee, using default:', error);
    // Hata durumunda varsayılan ücret kullan
    return { id: 0, fee: DEFAULT_DELIVERY_FEE };
  }
};

export const updateDeliveryFee = async (value: number): Promise<FeeDTO> => {
  const response = await axiosInstance.put('/fees/delivery', { value });
  return response.data;
}; 