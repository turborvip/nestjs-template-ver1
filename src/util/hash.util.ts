import * as bcrypt from 'bcrypt';

export const hashUtil = {
  hash: async function (str: string): Promise<string> {
    return await bcrypt.hash(str, 10);
  },

  compare: async function (str: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(str, hash);
  },
};
