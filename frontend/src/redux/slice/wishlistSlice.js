import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const getAuthToken = () => {
  return `Bearer ${localStorage.getItem("token") || localStorage.getItem("userToken")}`;
};

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wishlist`, {
        headers: {
          Authorization: getAuthToken(),
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/add",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/wishlist`,
        { productId },
        {
          headers: {
            Authorization: getAuthToken(),
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/wishlist/${productId}`,
        {
          headers: {
            Authorization: getAuthToken(),
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.products = action.payload.products || [];
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.products = action.payload.products || [];
      });
  },
});

export default wishlistSlice.reducer;

