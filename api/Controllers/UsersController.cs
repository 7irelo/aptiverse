using Aptiverse.Application.Auth.Dtos;
using Aptiverse.Application.Users.Dtos;
using Aptiverse.Application.Users.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Auth.Controllers
{
    [ApiController]
    [Route("api/users")]
    // Authenticated by default, per the house rule: opt into [AllowAnonymous]
    // per-action, never the other way round. This class had no class-level
    // attribute and GetOneUser had no action-level one either, so it was
    // reachable with no token at all: an unauthenticated GET returned 404 for
    // an unknown id rather than 401, which means the lookup ran for anonymous
    // callers. Anyone holding a user id could read that user's email, phone and
    // roles off the public internet. There is no FallbackPolicy configured
    // (Registrations.cs declares a RequireAuthenticatedUser policy but never
    // assigns it as the fallback), so an endpoint with no attribute is open,
    // not closed.
    [Authorize]
    public class UsersController(IUserService userService, ILogger<UsersController> logger) : ControllerBase
    {
        private readonly IUserService _userService = userService;
        private readonly ILogger<UsersController> _logger = logger;

        [HttpPost]
        [Authorize(Roles = "Admin,Superuser")]
        public async Task<IActionResult> CreateUser([FromBody] RegisterDto registerDto)
        {
            try
            {
                var result = await _userService.CreateUserAsync(registerDto);
                return CreatedAtAction(nameof(GetOneUser), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("already exists"))
            {
                return Conflict(new { message = ex.Message });
            }
            catch (ArgumentException ex) when (ex.Message.Contains("Invalid password"))
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Admin-only, matching every other action here. A student reading their
        // own record has /api/auth/me for it; nothing in the web app or the API
        // calls this route, so restricting it breaks no caller.
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Superuser")]
        public async Task<IActionResult> GetOneUser(string id)
        {
            try
            {
                var result = await _userService.GetOneUserAsync(id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Superuser")]
        public async Task<IActionResult> GetManyUsers(
            [FromQuery] string? email = null,
            [FromQuery] string? username = null,
            [FromQuery] string? firstName = null,
            [FromQuery] string? lastName = null,
            [FromQuery] string? phoneNumber = null)
        {
            try
            {
                var result = await _userService.GetManyUsersAsync(email, username, firstName, lastName, phoneNumber);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Superuser")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UserDto userDto)
        {
            try
            {
                var result = await _userService.UpdateUserAsync(id, userDto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Superuser")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            try
            {
                await _userService.DeleteUserAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
