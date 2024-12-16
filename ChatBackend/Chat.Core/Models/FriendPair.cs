using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Chat.Core.Models
{
    public class FriendPair
    {
        public Guid Id { get; }
        public Guid UserId { get; }
        public Guid FriendId { get; }

        public bool Confirm { get; }
        public bool Cancel { get; }

        private FriendPair(Guid id, Guid userId, Guid friendId, bool confirm, bool cancel)
        {
            Id = id;
            UserId = userId;
            FriendId = friendId;
            Confirm = confirm;
            Cancel = cancel;
        }

        public static FriendPair Create(Guid id, Guid userId, Guid friendId, bool confirm, bool cancel)
        {
            return new FriendPair(id, userId, friendId, confirm, cancel);
        }
    }
}
