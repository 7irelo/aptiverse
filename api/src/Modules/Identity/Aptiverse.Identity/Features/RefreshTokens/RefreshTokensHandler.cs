using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.SharedKernel.Results;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Identity.Features.RefreshTokens;

/// <summary>
/// Rotates the refresh token: the presented one is consumed and a new one issued with a fresh access token.
/// Presenting a consumed token is reuse, which <see cref="SessionService"/> answers by revoking the whole session.
/// </summary>
internal sealed partial class RefreshTokensHandler(SessionService sessions, AuthTokensFactory tokens, ILogger<RefreshTokensHandler> logger)
{
    public async Task<Result<AuthTokens>> HandleAsync(RefreshTokensRequest request, RequestInfo origin, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var rotated = await sessions.RotateAsync(request.RefreshToken, origin, cancellationToken);
        if (rotated.IsFailure)
        {
            IdentityMetrics.Refresh("invalid");
            return rotated.Error!;
        }

        var (user, session, refresh) = rotated.Value;
        IdentityMetrics.Refresh("rotated");
        LogRotated(logger, session.Id);
        return tokens.Create(user, session, refresh);
    }

    [LoggerMessage(Level = LogLevel.Debug, Message = "Rotated the refresh token of session {SessionId}")]
    private static partial void LogRotated(ILogger logger, Guid sessionId);
}
