using Chat.Core.Models;

namespace Chat.DataAccess.Repositories
{
    public interface IFriendRepository
    {
        Task<Guid> Create(FriendPair pair);
        Task<Guid> Delete(Guid id);
        Task<List<FriendPair>> Get();
        Task<List<FriendPair>> GetById(Guid id);
        Task<Guid> Update(Guid id, Guid idUser, Guid idFriend, bool confirm, bool cancel);
        Task<List<FriendPair>> GetByFriendId(Guid id);
    }
}