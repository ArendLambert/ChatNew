namespace Chat.Contracts
{
    public record PairRequest(
        Guid userId,
        Guid friendId,
        bool confirm,
        bool cancel);
}
