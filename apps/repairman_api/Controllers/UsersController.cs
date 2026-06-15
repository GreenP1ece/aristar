using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        var subject = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue("sub");
        var email = User.FindFirstValue(ClaimTypes.Email)
                    ?? User.FindFirstValue("email");
        var name = User.FindFirstValue("name")
                   ?? User.FindFirstValue(ClaimTypes.Name);

        return Ok(new { subject, email, name });
    }

    [HttpGet("admin-only")]
    [Authorize(Roles = "admin")]
    public IActionResult AdminEndpoint()
    {
        return Ok(new { message = "Hello, admin!" });
    }
}