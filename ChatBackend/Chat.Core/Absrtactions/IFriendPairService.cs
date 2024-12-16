using Chat.Core.Models;

namespace Chat.Application.Services
{
    public interface IFriendPairService
    {
        Task<Guid> CreatePair(FriendPair pair);
        Task<Guid> DeletePair(Guid id);
        Task<List<FriendPair>> GetAllPairs();
        Task<List<FriendPair>> GetById(Guid id);
        Task<List<FriendPair>> GetByFriendId(Guid id);
        Task<Guid> UpdatePair(Guid idPair, Guid idUser, Guid idFriend, bool confirm, bool cancel);
    }
}