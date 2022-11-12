ARG NODE_VERSION
ARG IMAGE_VARIANT

FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${NODE_VERSION}-${IMAGE_VARIANT}

RUN export DEBIAN_FRONTEND=noninteractive \
	# Install dependencies using apt-get
	&& apt-get update \
	&& apt-get install --assume-yes --no-install-recommends \
		shellcheck \
	# Cleanup apt-get
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/* \
	# Install manual dependencies
	&& curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sh
