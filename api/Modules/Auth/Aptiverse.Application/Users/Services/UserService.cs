using Aptiverse.Application.Auth.Dtos;
using Aptiverse.Application.Users.Dtos;
using Aptiverse.Domain.Models;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Application.Users.Services
{
    public class UserService(UserManager<User> userManager, IMapper mapper) : IUserService
    {
        private readonly UserManager<User> _userManager = userManager;
        private readonly IMapper _mapper = mapper;

        public async Task<UserDto> CreateUserAsync(RegisterDto registerDto)
        {
            var user = _mapper.Map<User>(registerDto);
            user.CreatedAt = DateTime.UtcNow;

            var result = await _userManager.CreateAsync(user, registerDto.Password ?? string.Empty);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));

                if (result.Errors.Any(e => e.Code.Contains("Duplicate")))
                {
                    throw new InvalidOperationException($"User already exists: {errors}");
                }
                else if (result.Errors.Any(e => e.Code.Contains("Password")))
                {
                    throw new ArgumentException($"Invalid password: {errors}");
                }
                else
                {
                    throw new InvalidOperationException($"User creation failed: {errors}");
                }
            }

            return _mapper.Map<UserDto>(user);
        }

        public async Task<UserDto> GetOneUserAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            return user == null ? throw new KeyNotFoundException($"User with ID {id} not found") : _mapper.Map<UserDto>(user);
        }

        public async Task<IEnumerable<UserDto>> GetManyUsersAsync(string? email = null, string? username = null, string? firstName = null, string? lastName = null, string? phoneNumber = null)
        {
            var query = _userManager.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(email))
            {
                query = query.Where(u => u.Email != null && u.Email.Contains(email));
            }

            if (!string.IsNullOrWhiteSpace(username))
            {
                query = query.Where(u => u.UserName != null && u.UserName.Contains(username));
            }

            if (!string.IsNullOrWhiteSpace(firstName))
            {
                query = query.Where(u => u.FirstName.Contains(firstName));
            }

            if (!string.IsNullOrWhiteSpace(lastName))
            {
                query = query.Where(u => u.LastName.Contains(lastName));
            }

            if (!string.IsNullOrWhiteSpace(phoneNumber))
            {
                query = query.Where(u => u.PhoneNumber != null && u.PhoneNumber.Contains(phoneNumber));
            }

            var users = await query.ToListAsync();
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        // An explicit allowlist, not a reflection sweep.
        //
        // This used to copy every non-blank UserDto property onto the User
        // property of the same name. Three things were wrong with that, and the
        // third is the reason an allowlist is the fix rather than a patch:
        //
        //   1. Email went straight onto the column, bypassing SetEmailAsync.
        //      Identity resolves a login against NormalizedEmail, not Email, so
        //      the write left the two disagreeing: the old address still logged
        //      in and the new one did not. EmailConfirmed also stayed true, so
        //      an admin-set address arrived pre-verified without anyone proving
        //      they own it. Same story for UserName and NormalizedUserName.
        //   2. Id matched a writable IdentityUser property, so a PUT could ask
        //      to reassign the primary key.
        //   3. UserDto.Grade is a string and User.Grade is an int?, so
        //      SetValue threw on any payload carrying a grade. The controller's
        //      catch-all turned that into a generic 400, which is why it read
        //      as a validation failure rather than the type error it was.
        //
        // The deeper problem is that the loop's write surface was "whatever the
        // two types happen to share", so adding a field to UserDto silently made
        // it writable by an admin PUT. Fields are listed here now, so widening
        // this is a decision someone makes on purpose.
        public async Task<UserDto> UpdateUserAsync(string id, UserDto userDto)
        {
            var user = await _userManager.FindByIdAsync(id) ?? throw new KeyNotFoundException($"User with ID {id} not found");

            if (!string.IsNullOrWhiteSpace(userDto.FirstName))
                user.FirstName = userDto.FirstName.Trim();

            if (!string.IsNullOrWhiteSpace(userDto.LastName))
                user.LastName = userDto.LastName.Trim();

            if (!string.IsNullOrWhiteSpace(userDto.School))
                user.School = userDto.School.Trim();

            // Grade crosses a type boundary: string on the wire, int? on the
            // row. Reject a non-numeric or out-of-range value outright instead
            // of throwing deep in a setter.
            if (!string.IsNullOrWhiteSpace(userDto.Grade))
            {
                if (!int.TryParse(userDto.Grade, out var grade) || grade < 10 || grade > 12)
                    throw new InvalidOperationException($"Grade must be a number from 10 to 12, got '{userDto.Grade}'.");

                user.Grade = grade;
            }

            // Identity-managed fields go through UserManager so the normalised
            // columns it indexes on are written too.
            if (!string.IsNullOrWhiteSpace(userDto.PhoneNumber) && userDto.PhoneNumber != user.PhoneNumber)
            {
                var phoneResult = await _userManager.SetPhoneNumberAsync(user, userDto.PhoneNumber.Trim());
                if (!phoneResult.Succeeded)
                    throw new InvalidOperationException($"User update failed: {string.Join(", ", phoneResult.Errors.Select(e => e.Description))}");
            }

            if (!string.IsNullOrWhiteSpace(userDto.UserName) && userDto.UserName != user.UserName)
            {
                var nameResult = await _userManager.SetUserNameAsync(user, userDto.UserName.Trim());
                if (!nameResult.Succeeded)
                    throw new InvalidOperationException($"User update failed: {string.Join(", ", nameResult.Errors.Select(e => e.Description))}");
            }

            if (!string.IsNullOrWhiteSpace(userDto.Email) && !string.Equals(userDto.Email, user.Email, StringComparison.OrdinalIgnoreCase))
            {
                var emailResult = await _userManager.SetEmailAsync(user, userDto.Email.Trim());
                if (!emailResult.Succeeded)
                    throw new InvalidOperationException($"User update failed: {string.Join(", ", emailResult.Errors.Select(e => e.Description))}");

                // An address nobody has proved they own is not a confirmed one,
                // whoever typed it. If a reset flow ever keys off email, an
                // admin-set address arriving pre-confirmed is a takeover path.
                user.EmailConfirmed = false;
            }

            // Id, Roles, Permissions, Features and PlanCode are deliberately not
            // written here. Id is the key; the rest are computed for the UI on
            // read (roles from Identity, permissions from PermissionResolver,
            // features from entitlements) and have their own write paths.

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                throw new InvalidOperationException($"User update failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            return _mapper.Map<UserDto>(user);
        }

        public async Task DeleteUserAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id) ?? throw new KeyNotFoundException($"User with ID {id} not found");
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                throw new Exception($"User deletion failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
        }
    }
}
