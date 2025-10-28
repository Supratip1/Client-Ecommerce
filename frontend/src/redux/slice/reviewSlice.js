import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const getAuthToken = () => {
  return `Bearer ${localStorage.getItem("token") || localStorage.getItem("userToken")}`;
};

export const fetchReviews = createAsyncThunk(
  "reviews/fetch",
  async ({ productId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/reviews/${productId}?page=${page}&limit=${limit}`
      );
      return response.data; // {reviews, page, pages, total, limit}
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createReview = createAsyncThunk(
  "reviews/create",
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/reviews`,
        reviewData,
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

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    reviews: [],
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
    loading: false,
    error: null,
  },
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
        state.limit = action.payload.limit;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.reviews.push(action.payload);
      });
  },
});

export const { clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;

