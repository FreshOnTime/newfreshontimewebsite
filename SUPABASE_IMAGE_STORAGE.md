# Supabase image storage

FreshPick stores runtime-uploaded product, category, blog and banner images in Supabase Storage in production. Netlify and Vercel host the application; their function filesystems are not treated as durable image storage. GitHub stores source-controlled static assets only.

## Production configuration

Set these server-side environment variables in the deployed application:

```env
SUPABASE_URL="https://<project-ref>.supabase.co"
SUPABASE_SECRET_KEY="<server-secret-key>"
SUPABASE_STORAGE_BUCKET="freshpick-images"
```

`SUPABASE_STORAGE_BUCKET` is optional and defaults to `freshpick-images`. The code also accepts the legacy `SUPABASE_SERVICE_ROLE_KEY` temporarily for projects that have not migrated to the newer server secret key.

Never expose the secret key through a `NEXT_PUBLIC_` variable.

## Bucket layout

The storage service uses one public bucket with separate folders:

- `product-images/`
- `category-images/`
- `blog-images/`
- `banner-images/`

The server checks for the configured bucket before upload and creates it as a public bucket when it is missing. Public reads use Supabase's conventional Storage URL:

```text
https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<folder>/<filename>
```

## Upload security

Image APIs remain protected by FreshPick authorization before storage access. The upload reader:

- limits the image to 4 MB,
- validates JPEG, PNG, WebP and AVIF signatures,
- ignores the original filename when generating the stored object name,
- uses the server-only Supabase secret for Storage writes,
- returns a public Supabase Storage URL for the saved image.

The secret key bypasses Storage RLS and must only be used by server code after FreshPick has performed its own authorization checks.

## Local development

When Supabase storage credentials are not configured and the application is running locally, images are written under:

```text
public/uploads/product-images/
public/uploads/category-images/
public/uploads/blog-images/
```

That local-disk fallback is development-only. Production/serverless deployments reject runtime uploads when Supabase Storage is not configured instead of writing to ephemeral disk.

## Deployment checklist

1. Add `SUPABASE_URL` and `SUPABASE_SECRET_KEY` to Netlify/Vercel server environment variables.
2. Optionally set `SUPABASE_STORAGE_BUCKET`; otherwise `freshpick-images` is used.
3. Deploy the application.
4. Upload one product, category and blog image from the admin UI.
5. Confirm returned URLs use `/storage/v1/object/public/`.
6. Confirm the images remain available after a new deployment.
7. Run `npm run check:production` with production configuration.

Static design assets already committed under `public/` remain source-controlled and do not need to be moved to Supabase Storage.
