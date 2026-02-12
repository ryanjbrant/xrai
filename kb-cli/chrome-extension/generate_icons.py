from PIL import Image
import cairosvg
import io
import os

# Create icons directory if it doesn't exist
os.makedirs('icons', exist_ok=True)

# Sizes needed for Chrome extension
sizes = [16, 32, 48, 128]

# Read the SVG file
with open('icons/icon.svg', 'rb') as f:
    svg_data = f.read()

# Generate PNG icons for each size
for size in sizes:
    # Convert SVG to PNG with CairoSVG
    png_data = cairosvg.svg2png(
        bytestring=svg_data,
        output_width=size,
        output_height=size
    )
    
    # Save the PNG
    output_path = f'icons/icon{size}.png'
    with open(output_path, 'wb') as f:
        f.write(png_data)
    
    print(f'Generated {output_path}')
