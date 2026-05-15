import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import makeApiRequest from "@/services/axios";
import { apiUrl } from "@/services/api-end-point";

interface RolePermissionsState {
  permissions: string[];
  loading: boolean;
  fetched: boolean;
}

const initialState: RolePermissionsState = {
  permissions: [],
  loading: false,
  fetched: false,
};

export const fetchRolePermissions = createAsyncThunk<string[], number>(
  "rolePermissions/fetch",
  async (roleId, { rejectWithValue }) => {
    try {
      const res = await makeApiRequest<{
        status: string;
        data: { permissions: Array<{ name: string }> };
      }>(`${apiUrl.getAllRoles}/${roleId}`);
      return res.data.permissions.map((p) => p.name);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch role permissions";
      return rejectWithValue(message);
    }
  }
);

const rolePermissionsSlice = createSlice({
  name: "rolePermissions",
  initialState,
  reducers: {
    clearRolePermissions: (state) => {
      state.permissions = [];
      state.loading = false;
      state.fetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolePermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.fetched = true;
        state.permissions = action.payload;
      })
      .addCase(fetchRolePermissions.rejected, (state) => {
        state.loading = false;
        state.fetched = true;
        state.permissions = [];
      });
  },
});

export const { clearRolePermissions } = rolePermissionsSlice.actions;
export default rolePermissionsSlice.reducer;
