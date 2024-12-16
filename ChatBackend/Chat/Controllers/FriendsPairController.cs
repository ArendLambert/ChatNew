using Chat.Application.Services;
using Chat.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Chat.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FriendsPairController : ControllerBase
    {
        private readonly IFriendPairService _friendPairService;
        public FriendsPairController(IFriendPairService friendPairService)
        {
            _friendPairService = friendPairService;
        }
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<PairsResponse>>> GetPairs()
        {
            var pairs = await _friendPairService.GetAllPairs();

            var pairResponse = pairs.Select(x => new PairsResponse(x.Id, x.UserId, x.FriendId, x.Confirm, x.Cancel));
            return Ok(pairResponse);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Guid>> CreatePair([FromBody] PairRequest request)
        {
            var pair = Chat.Core.Models.FriendPair.Create(Guid.NewGuid(),
                                                             request.userId,
                                                             request.friendId,
                                                             request.confirm,
                                                             request.cancel);
            var pairId = await _friendPairService.CreatePair(pair);
            return Ok(pairId);
        }

        [HttpPut("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<Guid>> UpdatePair(Guid id, [FromBody] PairRequest request)
        {
            var pairId = await _friendPairService.UpdatePair(id, request.userId, request.friendId, request.confirm, request.cancel);
            return Ok(pairId);
        }

        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<Guid>> DeletePair(Guid id)
        {
            var pairId = await _friendPairService.DeletePair(id);
            return Ok(pairId);
        }

        [HttpGet("by-id")]
        [Authorize]
        public async Task<ActionResult<PairsResponse>> GetById(Guid idPair)
        {
            var pairs = await _friendPairService.GetById(idPair);
            List<PairsResponse> pairResponses = new List<PairsResponse>();
            if (pairs != null)
            {
                foreach (var pair in pairs)
                {
                    pairResponses.Add(new PairsResponse(pair.Id, pair.UserId, pair.FriendId, pair.Confirm, pair.Cancel));
                }
            }
            return Ok(pairResponses);
        }

        [HttpGet("by-friend-id")]
        [Authorize]
        public async Task<ActionResult<PairsResponse>> GetByFriendId(Guid idPair)
        {
            var pairs = await _friendPairService.GetByFriendId(idPair);
            List<PairsResponse> pairResponses = new List<PairsResponse>();
            if (pairs != null)
            {
                foreach (var pair in pairs)
                {
                    pairResponses.Add(new PairsResponse(pair.Id, pair.UserId, pair.FriendId, pair.Confirm, pair.Cancel));
                }
            }
            return Ok(pairResponses);
        }
    }
}
