using Aptiverse.Goals.Application.GoalMilestones.Dtos;
using Aptiverse.Goals.Domain.Models.Goals;
using Aptiverse.Goals.Domain.Repositories;
using Aptiverse.Goals.Infrastructure.Utilities;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Security.Claims;

namespace Aptiverse.Goals.Application.GoalMilestones.Services
{
    public class GoalMilestoneService(
        IRepository<GoalMilestone> milestoneRepository,
        IMapper mapper) : IGoalMilestoneService
    {
        private readonly IRepository<GoalMilestone> _milestoneRepository = milestoneRepository;
        private readonly IMapper _mapper = mapper;

        public async Task<GoalMilestoneDto> CreateMilestoneAsync(CreateGoalMilestoneDto createMilestoneDto)
        {
            ArgumentNullException.ThrowIfNull(createMilestoneDto);

            var milestone = _mapper.Map<GoalMilestone>(createMilestoneDto);

            await _milestoneRepository.AddAsync(milestone);
            return _mapper.Map<GoalMilestoneDto>(milestone);
        }

        public async Task<GoalMilestoneDto?> GetMilestoneByIdAsync(long id)
        {
            var milestone = await _milestoneRepository.GetAsync(
                predicate: m => m.Id == id,
                disableTracking: false);

            return _mapper.Map<GoalMilestoneDto>(milestone);
        }

        public async Task<PaginatedResult<GoalMilestoneDto>> GetMilestonesAsync(
            ClaimsPrincipal currentUser,
            long? goalId = null,
            bool? isCompleted = null,
            string? sortBy = "Id",
            bool sortDescending = false,
            int page = 1,
            int pageSize = 20)
        {
            Expression<Func<GoalMilestone, bool>>? predicate = BuildRoleBasedPredicate(currentUser);

            if (goalId.HasValue || isCompleted.HasValue)
            {
                Expression<Func<GoalMilestone, bool>> filterPredicate = m =>
                    (!goalId.HasValue || m.GoalId == goalId.Value) &&
                    (!isCompleted.HasValue || m.IsCompleted == isCompleted.Value);

                predicate = predicate == null
                    ? filterPredicate
                    : CombinePredicates(predicate, filterPredicate);
            }

            Func<IQueryable<GoalMilestone>, IOrderedQueryable<GoalMilestone>>? orderBy =
                GetOrderByFunction(sortBy, sortDescending);

            var paginatedResult = await _milestoneRepository.GetPaginatedAsync(
                pageNumber: page,
                pageSize: pageSize,
                predicate: predicate,
                orderBy: orderBy);

            var milestoneDtos = _mapper.Map<List<GoalMilestoneDto>>(paginatedResult.Data);

            return new PaginatedResult<GoalMilestoneDto>(
                milestoneDtos,
                paginatedResult.TotalRecords,
                paginatedResult.PageNumber,
                paginatedResult.PageSize);
        }

        private Expression<Func<GoalMilestone, bool>>? BuildRoleBasedPredicate(ClaimsPrincipal user)
        {
            var userId = UserContextHelper.GetUserId(user);

            return m => false;
        }

        private Expression<Func<GoalMilestone, bool>> CombinePredicates(
            Expression<Func<GoalMilestone, bool>> left,
            Expression<Func<GoalMilestone, bool>> right)
        {
            var parameter = Expression.Parameter(typeof(GoalMilestone), "m");
            var leftBody = Expression.Invoke(left, parameter);
            var rightBody = Expression.Invoke(right, parameter);
            var combined = Expression.AndAlso(leftBody, rightBody);

            return Expression.Lambda<Func<GoalMilestone, bool>>(combined, parameter);
        }

        private Func<IQueryable<GoalMilestone>, IOrderedQueryable<GoalMilestone>>? GetOrderByFunction(
            string sortBy, bool sortDescending)
        {
            if (string.IsNullOrEmpty(sortBy))
                return null;

            return sortBy.ToLower() switch
            {
                "title" => sortDescending
                    ? query => query.OrderByDescending(m => m.Title)
                    : query => query.OrderBy(m => m.Title),
                "targetvalue" => sortDescending
                    ? query => query.OrderByDescending(m => m.TargetValue)
                    : query => query.OrderBy(m => m.TargetValue),
                "rewardpoints" => sortDescending
                    ? query => query.OrderByDescending(m => m.RewardPoints)
                    : query => query.OrderBy(m => m.RewardPoints),
                "iscompleted" => sortDescending
                    ? query => query.OrderByDescending(m => m.IsCompleted)
                    : query => query.OrderBy(m => m.IsCompleted),
                _ => sortDescending
                    ? query => query.OrderByDescending(m => m.Id)
                    : query => query.OrderBy(m => m.Id)
            };
        }

        public async Task<GoalMilestoneDto> UpdateMilestoneAsync(long id, UpdateGoalMilestoneDto updateMilestoneDto)
        {
            var existingMilestone = await _milestoneRepository.GetAsync(
                predicate: m => m.Id == id,
                disableTracking: false)
                ?? throw new KeyNotFoundException($"Goal milestone with ID {id} not found");

            var wasCompleted = existingMilestone.IsCompleted;

            _mapper.Map(updateMilestoneDto, existingMilestone);

            if (updateMilestoneDto.IsCompleted && !wasCompleted)
            {
                existingMilestone.CompletedAt = DateTime.UtcNow;
            }
            else if (!updateMilestoneDto.IsCompleted && wasCompleted)
            {
                existingMilestone.CompletedAt = null;
            }

            await _milestoneRepository.UpdateAsync(existingMilestone);
            return _mapper.Map<GoalMilestoneDto>(existingMilestone);
        }

        public async Task<bool> DeleteMilestoneAsync(long id)
        {
            var milestone = await _milestoneRepository.GetAsync(
                predicate: m => m.Id == id,
                disableTracking: false);

            if (milestone == null)
                return false;

            await _milestoneRepository.DeleteAsync(milestone);
            return true;
        }

        public async Task<int> CountMilestonesAsync(
            ClaimsPrincipal currentUser,
            long? goalId = null,
            bool? isCompleted = null)
        {
            var predicate = BuildRoleBasedPredicate(currentUser);

            Expression<Func<GoalMilestone, bool>> filterPredicate = m =>
                (!goalId.HasValue || m.GoalId == goalId.Value) &&
                (!isCompleted.HasValue || m.IsCompleted == isCompleted.Value);

            predicate = predicate == null
                ? filterPredicate
                : CombinePredicates(predicate, filterPredicate);

            return await _milestoneRepository.CountAsync(predicate);
        }

        public async Task<bool> MilestoneExistsAsync(long id)
        {
            return await _milestoneRepository.ExistsAsync(m => m.Id == id);
        }

        public async Task<IEnumerable<GoalMilestoneDto>> GetMilestonesByGoalAsync(long goalId)
        {
            var milestones = await _milestoneRepository.GetManyAsync(
                predicate: m => m.GoalId == goalId,
                orderBy: query => query.OrderBy(m => m.TargetValue),
                disableTracking: true);

            return _mapper.Map<IEnumerable<GoalMilestoneDto>>(milestones);
        }

        public async Task<IEnumerable<GoalMilestoneDto>> GetCompletedMilestonesAsync(long goalId)
        {
            var milestones = await _milestoneRepository.GetManyAsync(
                predicate: m => m.GoalId == goalId && m.IsCompleted,
                orderBy: query => query.OrderBy(m => m.CompletedAt),
                disableTracking: true);

            return _mapper.Map<IEnumerable<GoalMilestoneDto>>(milestones);
        }

        public async Task<IEnumerable<GoalMilestoneDto>> GetPendingMilestonesAsync(long goalId)
        {
            var milestones = await _milestoneRepository.GetManyAsync(
                predicate: m => m.GoalId == goalId && !m.IsCompleted,
                orderBy: query => query.OrderBy(m => m.TargetValue),
                disableTracking: true);

            return _mapper.Map<IEnumerable<GoalMilestoneDto>>(milestones);
        }

        public async Task<GoalMilestoneDto> MarkMilestoneCompleteAsync(long id)
        {
            var milestone = await _milestoneRepository.GetAsync(
                predicate: m => m.Id == id,
                disableTracking: false)
                ?? throw new KeyNotFoundException($"Goal milestone with ID {id} not found");

            if (!milestone.IsCompleted)
            {
                milestone.IsCompleted = true;
                milestone.CompletedAt = DateTime.UtcNow;
                await _milestoneRepository.UpdateAsync(milestone);
            }

            return _mapper.Map<GoalMilestoneDto>(milestone);
        }

        public async Task<GoalMilestoneDto> MarkMilestoneIncompleteAsync(long id)
        {
            var milestone = await _milestoneRepository.GetAsync(
                predicate: m => m.Id == id,
                disableTracking: false)
                ?? throw new KeyNotFoundException($"Goal milestone with ID {id} not found");

            if (milestone.IsCompleted)
            {
                milestone.IsCompleted = false;
                milestone.CompletedAt = null;
                await _milestoneRepository.UpdateAsync(milestone);
            }

            return _mapper.Map<GoalMilestoneDto>(milestone);
        }

        public async Task<int> GetTotalRewardPointsAsync(long goalId)
        {
            var milestones = await _milestoneRepository.GetManyAsync(
                predicate: m => m.GoalId == goalId && m.IsCompleted,
                disableTracking: true);

            return milestones.Sum(m => m.RewardPoints);
        }
    }
}