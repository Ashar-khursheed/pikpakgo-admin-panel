import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import makeApiRequest from "@/services/axios";
import { apiUrl } from "@/services/api-end-point";

// ─── Types ───────────────────────────────────────────────
export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  user_type: string;
  status: string;
  email_verified: boolean;
  country: string;
  city?: string;
  state?: string;
  zip_code?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  preferred_currency: string;
  preferred_language: string;
  role_id?: number | null;
  role_name?: string | null;
}

interface UserProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserProfileState = {
  profile: null,
  loading: false,
  error: null,
};

// ─── Async Thunk ─────────────────────────────────────────
export const fetchUserProfile = createAsyncThunk<UserProfile>(
  "userProfile/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await makeApiRequest<{ success: boolean; data: UserProfile }>(
        apiUrl.me
      );
      return response.data;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch profile";
      return rejectWithValue(message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────
const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
    setUserProfile: (state, action) => {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserProfile, setUserProfile } = userProfileSlice.actions;
export default userProfileSlice.reducer;
