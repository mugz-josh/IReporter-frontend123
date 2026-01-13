export const toast = {
  success: (message: string) => {
    console.log("Success:", message);
    // You can integrate with your preferred toast library here
  },
  error: (message: string) => {
    console.error("Error:", message);
    // You can integrate with your preferred toast library here
  },
  info: (message: string) => {
    console.log("Info:", message);
    // You can integrate with your preferred toast library here
  }
};
