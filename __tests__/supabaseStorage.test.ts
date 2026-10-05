describe('SupabaseStorageService', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SECRET_KEY: 'sb_secret_test',
      SUPABASE_STORAGE_BUCKET: 'freshpick-images',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('creates the public bucket when missing and uploads to a scoped folder', async () => {
    const fetchMock = jest.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'not found' }), { status: 404 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    const { getProductImageStorage } = await import('@/lib/storage/supabaseStorage');
    const url = await getProductImageStorage().uploadFile(
      'image.webp',
      Buffer.from('valid-bytes'),
      'image/webp',
    );

    expect(url).toBe(
      'https://project.supabase.co/storage/v1/object/public/freshpick-images/product-images/image.webp',
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://project.supabase.co/storage/v1/bucket/freshpick-images',
      expect.objectContaining({ cache: 'no-store' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://project.supabase.co/storage/v1/bucket',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"public":true'),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'https://project.supabase.co/storage/v1/object/freshpick-images/product-images/image.webp',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          apikey: 'sb_secret_test',
          Authorization: 'Bearer sb_secret_test',
          'Content-Type': 'image/webp',
        }),
      }),
    );
  });

  it('refuses a private bucket because returned image URLs must be publicly readable', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'freshpick-images', public: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ) as typeof fetch;

    const { getBlogImageStorage } = await import('@/lib/storage/supabaseStorage');
    await expect(
      getBlogImageStorage().uploadFile('article.png', Buffer.from('x'), 'image/png'),
    ).rejects.toThrow('must be public');
  });

  it('requires server-only Supabase storage credentials', async () => {
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    global.fetch = jest.fn() as typeof fetch;

    const { getCategoryImageStorage } = await import('@/lib/storage/supabaseStorage');
    await expect(
      getCategoryImageStorage().uploadFile('category.jpg', Buffer.from('x'), 'image/jpeg'),
    ).rejects.toThrow('SUPABASE_SECRET_KEY');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
