import prisma from "../config/prisma.js";

export class ConversationService {
  async getConversations(userId: string) {
    return prisma.aIConversation.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getConversation(userId: string, conversationId: string) {
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return null;
    }

    if (conversation.userId !== userId) {
      throw new Error("FORBIDDEN: You do not have permission to access this conversation.");
    }

    return conversation;
  }

  async createConversation(userId: string, initialMessage: string) {
    // Generate concise title from initial user message
    const title = initialMessage.length > 40
      ? `${initialMessage.substring(0, 37)}...`
      : initialMessage;

    return prisma.aIConversation.create({
      data: {
        userId,
        title,
      },
    });
  }

  async addMessage(conversationId: string, role: string, content: string) {
    const message = await prisma.aIMessage.create({
      data: {
        conversationId,
        role,
        content,
      },
    });

    // Touch conversation updatedAt timestamp
    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async deleteConversation(userId: string, conversationId: string) {
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return false;
    }

    if (conversation.userId !== userId) {
      throw new Error("FORBIDDEN: You do not have permission to delete this conversation.");
    }

    await prisma.aIConversation.delete({
      where: { id: conversationId },
    });

    return true;
  }
}

export const conversationService = new ConversationService();
