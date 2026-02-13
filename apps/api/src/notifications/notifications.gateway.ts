import { OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/events', cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnModuleInit {
  @WebSocketServer()
  server!: Server;

  constructor(private jwt: JwtService) {}

  onModuleInit() {
    // TODO hook OpenTelemetry spans for socket lifecycle
  }

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (!token) return client.disconnect();
    try {
      this.jwt.verify(token, { secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret' });
    } catch {
      client.disconnect();
    }
  }

  emitWorldTick(payload: unknown) {
    this.server.emit('world.tick', payload);
  }
}
