using Microsoft.EntityFrameworkCore;
using Caseflow.Models;

namespace Caseflow.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Case> Cases => Set<Case>();
    public DbSet<CaseDocument> CaseDocuments => Set<CaseDocument>();
    public DbSet<CaseEvent> CaseEvents => Set<CaseEvent>();
    public DbSet<Extraction> Extractions => Set<Extraction>();
    public DbSet<Analysis> Analyses => Set<Analysis>();
    public DbSet<PendingApproval> PendingApprovals => Set<PendingApproval>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Case>().Property(c => c.State).HasConversion<string>();
        modelBuilder.Entity<CaseDocument>().Property(d => d.DocumentType).HasConversion<string>();
        modelBuilder.Entity<CaseEvent>().Property(e => e.EventType).HasConversion<string>();
        modelBuilder.Entity<CaseEvent>().Property(e => e.Actor).HasConversion<string>();
        modelBuilder.Entity<Extraction>().Property(e => e.ExtractionType).HasConversion<string>();
        modelBuilder.Entity<Analysis>().Property(a => a.AnalysisType).HasConversion<string>();
        modelBuilder.Entity<PendingApproval>().Property(a => a.Decision).HasConversion<string>();

        modelBuilder.Entity<CaseDocument>().HasIndex(d => d.CaseId);
        modelBuilder.Entity<CaseEvent>().HasIndex(e => e.CaseId);
        modelBuilder.Entity<CaseEvent>().HasIndex(e => e.At);
        modelBuilder.Entity<Extraction>().HasIndex(e => e.CaseId);
        modelBuilder.Entity<Analysis>().HasIndex(a => a.CaseId);
        modelBuilder.Entity<PendingApproval>().HasIndex(a => a.CaseId);
        modelBuilder.Entity<PendingApproval>().HasIndex(a => a.ResolvedAt);
    }

    public override int SaveChanges()
    {
        EnforceAppendOnlyAuditLog();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        EnforceAppendOnlyAuditLog();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void EnforceAppendOnlyAuditLog()
    {
        foreach (var entry in ChangeTracker.Entries<CaseEvent>())
        {
            if (entry.State is EntityState.Modified or EntityState.Deleted)
            {
                throw new InvalidOperationException(
                    "CaseEvent is append-only by design. UPDATE and DELETE are forbidden.");
            }
        }
    }
}
