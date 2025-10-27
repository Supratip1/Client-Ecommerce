import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API_ENDPOINTS from "../../config/api.js";
import { fetchCart } from "./cartSlice";

//Retrive user info and token from localstorage if available

const userFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

//check for an existing guest ID in the localStorage or generate a new one
const initialGuestId =
  localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", initialGuestId);

//Initial state for the auth slice
const initialState = {
  user: userFromStorage,
  guestId: initialGuestId,
  loading: false,
  error: null,
};

//ASyncthunk for user login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithVlaue }) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.LOGIN,
        userData
      );
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", response.data.token);

      return response.data.user;
    } catch (error) {
      return rejectWithVlaue(error.response.data);
    }
  }
);

//ASyncthunk for user register
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithVlaue }) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.REGISTER,
        userData
      );
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", response.data.token);

      return response.data.user;
    } catch (error) {
      return rejectWithVlaue(error.response.data);
    }
  }
);

//Async thunk for Google OAuth login
export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async ({ user, token }, { dispatch, rejectWithValue }) => {
    try {
      // Store user info and token
      localStorage.setItem("userInfo", JSON.stringify(user));
      localStorage.setItem("userToken", token);

      return user;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

//Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      // Keep the same guest ID to maintain cart persistence
      // state.guestId = `guest_${new Date().getTime()}`; //Reset guest ID o logout
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      // localStorage.setItem("guestId", state.guestId); // Set new guest ID in localStorage
    },
    generateNewGuestId: (state) => {
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.setItem("guestId", state.guestId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        // Fetch user's cart after successful login
        // This will be handled by the component that calls loginUser
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;

        // If payload is a string, use it. If it's an object, get its .message
        const payload = action.payload;
        const error =
          typeof payload === "string"
            ? payload
            : payload?.message || action.error?.message || "Unknown error";

        state.error = error;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Google login failed";
      });
  },
});

export const { logout, generateNewGuestId } = authSlice.actions;
export default authSlice.reducer;
