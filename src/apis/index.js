import axios from 'axios'
import { API_ROOT } from '../utils/constants'

/** Boards **/
export const fetchBoardDetailsAPI = async (boardId) => {
  const request = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
  //Lưu trữ: axios trả kết quả về qua property của nó là data
  return request.data
}

export const updateBoardDetailsAPI = async (boardId, updateData) => {
  const request = await axios.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  //Lưu trữ: axios trả kết quả về qua property của nó là data
  return request.data
}

export const moveCardToDifferentColumnsAPI = async (updateData) => {
  const request = await axios.put(`${API_ROOT}/v1/boards/supports/moving_card`, updateData)
  //Lưu trữ: axios trả kết quả về qua property của nó là data
  return request.data
}

/** Columns **/
export const createNewColumnAPI = async (data) => {
  const request = await axios.post(`${API_ROOT}/v1/columns`, data)
  //Lưu trữ: axios trả kết quả về qua property của nó là data
  return request.data
}
export const updateColumnDetailsAPI = async (columnId, updateData) => {
  const request = await axios.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)
  //Lưu trữ: axios trả kết quả về qua property của nó là data
  return request.data
}

export const deleteColumnDetailsAPI = async (columnId) => {
  const request = await axios.delete(`${API_ROOT}/v1/columns/${columnId}`)
  //Lưu trữ: axios trả kết quả về qua property của nó là data
  return request.data
}

/** Cards **/
export const createNewCardAPI = async (data) => {
  const request = await axios.post(`${API_ROOT}/v1/cards`, data)
  //Lưu trữ: axios trả kết quả về qua property của nó là data
  return request.data
}