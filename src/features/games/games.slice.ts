import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  total: 0,
  totalFiltered: 0,
  isVideoPlayed: false
};

export const gamesSlice = createSlice({
  name: 'gamesSlice',
  initialState,
  reducers: {
    setTotal: (state, action) => {
      state.total = action.payload;
    },
    setFilteredTotal: (state, action) => {
      state.totalFiltered = action.payload;
    },
    toggleIsVideoPlayed: (state) => {
      state.isVideoPlayed = !state.isVideoPlayed
    },
  }
});

export const { setTotal, setFilteredTotal, toggleIsVideoPlayed } = gamesSlice.actions;
export default gamesSlice.reducer;