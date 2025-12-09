# Hebrew Font Setup for PDF Generation

## Overview
To properly render Hebrew text in PDFs, you need to install Hebrew-supporting fonts. The application will automatically use these fonts if they are available.

## Option 1: Download OpenSans Fonts (Recommended)

1. Download OpenSans fonts from [Google Fonts](https://fonts.google.com/specimen/Open+Sans):
   - [OpenSans Regular](https://github.com/google/fonts/raw/main/apache/opensans/OpenSans-Regular.ttf)
   - [OpenSans Bold](https://github.com/google/fonts/raw/main/apache/opensans/OpenSans-Bold.ttf)

2. Place the font files in: `src/assets/fonts/`
   ```
   src/assets/fonts/
   ├── OpenSans-Regular.ttf
   └── OpenSans-Bold.ttf
   ```

3. The application will automatically detect and use these fonts.

## Option 2: Use Noto Sans Hebrew (Alternative)

1. Download Noto Sans Hebrew from [Google Fonts](https://fonts.google.com/noto/specimen/Noto+Sans+Hebrew):
   - [Noto Sans Hebrew Regular](https://github.com/google/fonts/raw/main/ofl/notosanshebrew/NotoSansHebrew-Regular.ttf)
   - [Noto Sans Hebrew Bold](https://github.com/google/fonts/raw/main/ofl/notosanshebrew/NotoSansHebrew-Bold.ttf)

2. Update `src/app.service.ts` to use NotoSansHebrew:
   ```typescript
   const normalFontPath = path.join(fontsPath, 'NotoSansHebrew-Regular.ttf');
   const boldFontPath = path.join(fontsPath, 'NotoSansHebrew-Bold.ttf');
   ```

3. Update the font name in the document definition:
   ```typescript
   this.fonts = {
     NotoSansHebrew: {
       normal: normalFontPath,
       bold: boldFontPath,
       // ...
     },
   };
   ```

## Option 3: System Fonts (Fallback)

If no TTF files are found, the application will attempt to use system fonts. However, this may not render Hebrew correctly on all systems.

## Verification

After installing fonts, restart your application. The PDFs should now display Hebrew text correctly with proper RTL alignment.

## Troubleshooting

- **Hebrew text still appears corrupted**: Ensure font files are in the correct location and the application has read permissions.
- **Fonts not loading**: Check that the file paths are correct and fonts are valid TTF files.
- **RTL alignment issues**: The `direction: 'rtl'` property is set in the document definition - ensure pdfmake version supports this.

