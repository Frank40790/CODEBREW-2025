FROM alpine:3.14

RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN addgroup -S user && adduser -S user -G user
WORKDIR /home/user
COPY scripts/ .
RUN chmod +x *
USER user
CMD ["/bin/sh"]