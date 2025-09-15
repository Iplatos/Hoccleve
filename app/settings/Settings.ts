
export const now = new Date();
export const year = now.getFullYear();
export const month = String(now.getMonth() + 1).padStart(2, '0');
export const day = String(now.getDate()).padStart(2, '0');
export const todayDate = `${year}-${month}-${day}`;
export const initialDate = `${year}-${month}-01`; // 1я дата месяца


