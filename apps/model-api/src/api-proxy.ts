import { request as httpRequest } from "node:http"
import { request as httpsRequest } from "node:https"
import type { RequestHandler } from "express"

const hopByHopHeaders = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
])

export function createApiProxy(upstreamValue: string): RequestHandler {
  const upstream = new URL(upstreamValue)
  const requestUpstream =
    upstream.protocol === "https:" ? httpsRequest : httpRequest

  return (request, response, next) => {
    const proxyRequest = requestUpstream(
      new URL(request.originalUrl, upstream),
      {
        method: request.method,
        headers: {
          ...request.headers,
          host: upstream.host,
        },
      },
      (proxyResponse) => {
        response.status(proxyResponse.statusCode ?? 502)
        for (const [name, value] of Object.entries(proxyResponse.headers)) {
          if (value !== undefined && !hopByHopHeaders.has(name.toLowerCase())) {
            response.setHeader(name, value)
          }
        }
        proxyResponse.pipe(response)
      },
    )

    proxyRequest.once("error", next)
    request.pipe(proxyRequest)
  }
}
