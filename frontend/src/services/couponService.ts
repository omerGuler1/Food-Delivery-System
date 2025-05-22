import axiosInstance from './axiosConfig';

export interface Coupon {
  id?: number;
  name: string;
  description: string;
  discountAmount: number;
  minOrderAmount: number;
  quota: number;
  usageCount: number;
  createdAt: string;
  endDate: string | null;
  isActive: boolean;
}

export interface CouponRequest {
  name: string;
  description: string;
  discountAmount: number;
  minOrderAmount: number;
  quota: number;
  endDate: string | null;
  isActive: boolean;
}

export interface CouponValidationResponse {
  valid: boolean;
  couponId?: number;
  name?: string;
  description?: string;
  discountAmount?: number;
  minOrderAmount?: number;
  message: string;
}

export const getAllCoupons = async (): Promise<Coupon[]> => {
  const response = await axiosInstance.get('/coupons');
  return response.data;
};

export const getActiveCoupons = async (): Promise<Coupon[]> => {
  const response = await axiosInstance.get('/coupons/active');
  return response.data;
};

export const getInactiveCoupons = async (): Promise<Coupon[]> => {
  const response = await axiosInstance.get('/coupons/inactive');
  return response.data;
};

export const getCouponById = async (id: number): Promise<Coupon> => {
  const response = await axiosInstance.get(`/coupons/${id}`);
  return response.data;
};

export const createCoupon = async (couponData: CouponRequest): Promise<Coupon> => {
  const response = await axiosInstance.post('/coupons', couponData);
  return response.data;
};

export const updateCoupon = async (id: number, couponData: CouponRequest): Promise<Coupon> => {
  const response = await axiosInstance.put(`/coupons/${id}`, couponData);
  return response.data;
};

export const deleteCoupon = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/coupons/${id}`);
};

export const toggleCouponStatus = async (id: number): Promise<Coupon> => {
  const response = await axiosInstance.patch(`/coupons/${id}/toggle-status`);
  return response.data;
};

// Validate coupon code
export const validateCoupon = async (couponCode: string, orderTotal: number): Promise<CouponValidationResponse> => {
  try {
    const response = await axiosInstance.get(`/coupons/validate/${couponCode}?orderTotal=${orderTotal}`);
    return response.data;
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    
    // Return a default error response
    return {
      valid: false,
      message: error.response?.data?.message || 'Failed to validate coupon. Please try again.'
    };
  }
}; 