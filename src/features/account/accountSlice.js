import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  address: "",
  balance: "0",
  nonce: "0",
  status: false,
  profile: {
    name: "",
    email: "",
    isRegistered: false,
  },
  rpcUrl: "http://127.0.0.1:7545", // Default Ganache GUI port
  contractAddress: "0xf8e81D47203A594245E36C48e151709F0C19fBe8", // Deployed contract address
};

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    login: (state, action) => {
      state.address = action.payload.address;
      state.balance = action.payload.balance;
      state.nonce = action.payload.nonce;
      state.status = true;
      if (action.payload.profile) {
        state.profile = action.payload.profile;
      }
    },
    logout: (state) => {
      state.address = "";
      state.balance = "0";
      state.nonce = "0";
      state.status = false;
      state.profile = {
        name: "",
        email: "",
        isRegistered: false,
      };
    },
    updateAccount: (state, action) => {
      if (action.payload.balance !== undefined) state.balance = action.payload.balance;
      if (action.payload.nonce !== undefined) state.nonce = action.payload.nonce;
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    updateNetwork: (state, action) => {
      if (action.payload.rpcUrl !== undefined) state.rpcUrl = action.payload.rpcUrl;
      if (action.payload.contractAddress !== undefined) {
        state.contractAddress = action.payload.contractAddress;
      }
    },
  },
});

export const { login, logout, updateAccount, updateProfile, updateNetwork } = accountSlice.actions;
export default accountSlice.reducer;
