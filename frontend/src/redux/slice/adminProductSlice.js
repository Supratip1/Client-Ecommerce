import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

// Get token dynamically
const getAuthToken = () => {
  return `Bearer ${localStorage.getItem("token") || localStorage.getItem("userToken")}`;
};

//async thunk to fetch admin rproducts
export const fetchAdminProducts = createAsyncThunk(
  "adminProducts/fetchProducts",
  async () => {
    const response = await axios.get(`${API_BASE_URL}/api/admin/products`, {
      headers: {
        Authorization: getAuthToken(),
      },
    });
    return response.data;
  }
);

//async function to create a new product
export const createProduct = createAsyncThunk(
  "adminProducts/createProduct",
  async (productData) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/products`,
      productData,
      {
        headers: {
          Authorization: getAuthToken(),
        },
      }
    );
    return response.data;
  }
);

//async thunk to update an existing product
export const updateProduct = createAsyncThunk(
  "adminProducts/updateProduct",
  async ({ id, productData }) => {
    const response = await axios.put(
      `${API_BASE_URL}/api/admin/products/${id}`,
      productData,
      {
        headers: {
          Authorization: getAuthToken(),
        },
      }
    );
    return response.data;
  }
);

//async thunk to delete the product
export const deleteProduct = createAsyncThunk(
  "adminProducts/deleteProduct",
  async (id) => {
    await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
      headers: {
        Authorization: getAuthToken(),
      },
    });
    return id;
  }
);

const adminProductSlice = createSlice({
  name: "adminProducts",
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      //Create Product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      //Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(
          (product) => product._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      //Delete prodcut
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (product) => product._id !== action.payload
        );
      });
  },
});

export default adminProductSlice.reducer;
