using System.Data;

namespace MovieTrackerBE.Data;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}
