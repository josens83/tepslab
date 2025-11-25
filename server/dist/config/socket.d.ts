import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
export declare const initSocket: (server: HTTPServer) => Server;
export declare const getIO: () => Server | null;
export declare const emitToUser: (userId: string, event: string, data: any) => void;
export declare const emitToCourse: (courseId: string, event: string, data: any) => void;
export declare const emitToAll: (event: string, data: any) => void;
//# sourceMappingURL=socket.d.ts.map