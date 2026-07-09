const mockPrisma = {
    subscriber: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
};

jest.mock("@/lib/prisma", () => ({
    __esModule: true,
    default: mockPrisma,
}));

// Mock mail service
jest.mock("@/lib/services/mailService", () => ({
    sendEmail: jest.fn().mockResolvedValue(undefined),
}));

describe("Newsletter API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /api/newsletter", () => {
        it("should reject invalid email addresses", async () => {
            const { POST } = await import(
                "@/app/api/newsletter/route"
            );

            const request = new Request("http://localhost:3000/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "invalid-email" }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.ok).toBe(false);
            expect(data.error).toContain("valid email");
        });

        it("should reject empty email", async () => {
            const { POST } = await import(
                "@/app/api/newsletter/route"
            );

            const request = new Request("http://localhost:3000/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "" }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.ok).toBe(false);
        });

        it("should handle already subscribed emails", async () => {
            mockPrisma.subscriber.findUnique.mockResolvedValue({
                email: "existing@example.com",
                isActive: true,
            });

            const { POST } = await import(
                "@/app/api/newsletter/route"
            );

            const request = new Request("http://localhost:3000/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "existing@example.com" }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(409);
            expect(data.ok).toBe(false);
            expect(data.error).toContain("already subscribed");
        });

        it("should successfully subscribe new email", async () => {
            mockPrisma.subscriber.findUnique.mockResolvedValue(null);
            mockPrisma.subscriber.create.mockResolvedValue({
                email: "new@example.com",
                isActive: true,
            });

            const { POST } = await import(
                "@/app/api/newsletter/route"
            );

            const request = new Request("http://localhost:3000/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "new@example.com" }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.ok).toBe(true);
            expect(mockPrisma.subscriber.create).toHaveBeenCalledWith({
                data: {
                    email: "new@example.com",
                    source: "homepage",
                },
            });
        });

        it("should reactivate inactive subscription", async () => {
            mockPrisma.subscriber.findUnique.mockResolvedValue({
                email: "inactive@example.com",
                isActive: false,
            });
            mockPrisma.subscriber.update.mockResolvedValue({
                email: "inactive@example.com",
                isActive: true,
            });

            const { POST } = await import(
                "@/app/api/newsletter/route"
            );

            const request = new Request("http://localhost:3000/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "inactive@example.com" }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.ok).toBe(true);
            expect(mockPrisma.subscriber.update).toHaveBeenCalledWith({
                where: { email: "inactive@example.com" },
                data: {
                    isActive: true,
                    subscribedAt: expect.any(Date),
                    unsubscribedAt: null,
                },
            });
        });
    });
});
