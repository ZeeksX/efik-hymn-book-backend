declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'user' | 'editor' | 'admin';
        status: 'active' | 'suspended';
      };
    }
  }
}

export {};
