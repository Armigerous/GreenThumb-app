# Sentry Source Maps Configuration

## What are Source Maps?

Source maps are files that map minified/compiled code back to your original TypeScript/JavaScript source code. They're essential for effective error tracking in production apps.

### Benefits

- **Exact line numbers** in error reports instead of minified code
- **Better debugging** of production crashes
- **Faster issue resolution** with precise error locations
- **Improved error context** in Sentry dashboard

## Current Configuration

### ✅ Production Builds (App Store)

- **Source maps enabled** for better error tracking
- **Automatic upload** during build process
- **Full error context** available in Sentry

### ⚠️ Development Builds

- **Source maps disabled** by default to prevent build issues
- **Can be enabled** by uncommenting line in `ios/.xcode.env`
- **Faster builds** without upload overhead

## How to Use

### 1. Production Builds (Recommended)

```bash
# Build for App Store with source maps
eas build --platform ios --profile production
```

### 2. Development Builds

```bash
# Quick development build (source maps disabled)
eas build --platform ios --profile development

# Or enable source maps for development
./scripts/configure-sentry.sh enable
eas build --platform ios --profile development
```

### 3. Managing Source Maps

```bash
# Enable source maps for all builds
./scripts/configure-sentry.sh enable

# Disable source maps (if builds fail)
./scripts/configure-sentry.sh disable

# Test current configuration
./scripts/configure-sentry.sh test
```

## Error Tracking Examples

### Without Source Maps

```
Error: Cannot read property 'name' of undefined
at a (index.bundle.js:1:1234)
at b (index.bundle.js:1:5678)
```

### With Source Maps

```
Error: Cannot read property 'name' of undefined
at calculatePlantWatering (components/PlantCard.tsx:45:12)
at handlePlantClick (screens/GardenScreen.tsx:23:8)
```

## Configuration Files

### `eas.json` - Production Environment

```json
"production": {
  "env": {
    "SENTRY_ORG": "eren-kahveci",
    "SENTRY_PROJECT": "greenthumb",
    "SENTRY_URL": "https://sentry.io/",
    "SENTRY_AUTH_TOKEN": "...",
    "SENTRY_RELEASE_NAME": "greenthumb-ios",
    "SENTRY_DIST": "1",
    "SENTRY_UPLOAD_SOURCE_MAPS": "true"
  }
}
```

### `ios/.xcode.env` - Local Build Control

```bash
# Enable source maps (uncomment for development)
# export SENTRY_DISABLE_AUTO_UPLOAD=true
```

### `app.config.js` - Plugin Configuration

```javascript
[
  "@sentry/react-native/expo",
  {
    url: "https://sentry.io/",
    project: process.env.SENTRY_PROJECT || "greenthumb",
    organization: process.env.SENTRY_ORG || "eren-kahveci",
    uploadSourceMaps: true, // Enable for production
  },
];
```

## Troubleshooting

### Build Fails with Sentry Errors

```bash
# Quick fix - disable source maps
./scripts/configure-sentry.sh disable

# Then rebuild
eas build --platform ios --profile production
```

### Source Maps Not Uploading

1. Check auth token in `ios/sentry.properties`
2. Verify organization and project names
3. Test configuration: `./scripts/configure-sentry.sh test`

### Errors Still Show Minified Code

1. Ensure source maps are enabled for the build profile
2. Check that the correct release is tagged in Sentry
3. Verify the build completed successfully

## Best Practices

### ✅ Do

- Use source maps for production builds
- Test error tracking in staging environment
- Monitor Sentry dashboard for upload success
- Keep auth tokens secure and up-to-date

### ❌ Don't

- Enable source maps for development builds (slower)
- Commit auth tokens to version control
- Ignore Sentry upload failures
- Use source maps without proper error handling

## Monitoring

### Check Sentry Dashboard

1. Go to [Sentry Dashboard](https://sentry.io/organizations/eren-kahveci/projects/greenthumb/)
2. Look for "Releases" section
3. Verify source maps are attached to releases
4. Check error reports show original code

### Build Logs

Look for these messages in build logs:

```
✅ Source maps uploaded successfully
📦 Release greenthumb-ios@1.0.1 created
🔗 Source maps attached to release
```

## Next Steps

1. **Test the current setup** with a production build
2. **Monitor error reports** in Sentry dashboard
3. **Verify source maps** are working correctly
4. **Optimize error tracking** based on real usage data
