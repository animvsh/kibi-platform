
export const simulateOpenAIValidation = async (text: string) => {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      const isValid = text.length > 5;
      resolve(isValid);
    }, 1000);
  });
};
