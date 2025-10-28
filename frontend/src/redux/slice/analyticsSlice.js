import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const getAuthToken = () => {
  return `Bearer ${localStorage.getItem("token") || localStorage.getItem("userToken")}`;
};

export const fetchAnalyticsOverview = createAsyncThunk(
  "analytics/fetchOverview",
  async (days = 30, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/analytics/overview?days=${days}`,
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

export const fetchProductAnalytics = createAsyncThunk(
  "analytics/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/analytics/products`,
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

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    overview: null,
    productAnalytics: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchAnalyticsOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.productAnalytics = action.payload;
      })
      .addCase(fetchProductAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default analyticsSlice.reducer;

