namespace Chat.Contracts
{
    public record PairsResponse
    (
        Guid IdPair,
        Guid IdUser,
        Guid IdFriend,
        bool confirm,
        bool cancel
    );
}
