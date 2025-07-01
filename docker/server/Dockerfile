# ---- Builder Stage ----
FROM rustlang/rust:nightly as builder

ARG TARGETPLATFORM
RUN echo "Building for $TARGETPLATFORM"

WORKDIR /app

# Copy the source code for the 'core' application
COPY core/ ./core/

# Build the 'core' binary
RUN cd core && cargo build --release

# ---- Final Stage ----
FROM debian:bookworm-slim

RUN apt-get update -y && apt-get install -y \
    pkg-config \
    build-essential \
    libssl-dev \
    libpq-dev \
    ca-certificates \
    libreoffice \
    file \
    curl \
    imagemagick \
    pandoc \
    && mkdir -p /app/tmp \
    && sed -i 's/rights="none" pattern="PDF"/rights="read|write" pattern="PDF"/' /etc/ImageMagick-6/policy.xml

WORKDIR /app

# Download and extract PDFium binary based on architecture
ARG TARGETARCH
RUN mkdir -p /app/pdfium-binaries && \
    curl -L https://github.com/bblanchon/pdfium-binaries/releases/download/chromium/7256/pdfium-v8-linux-x64.tgz | \
    tar -xz -C /tmp && \
    cp /tmp/lib/libpdfium.so /app/pdfium-binaries/

# Copy the pre-built binary from the builder stage
COPY --from=builder /app/core/target/release/core /app/core

EXPOSE 8000
ENTRYPOINT ["/app/core"] 