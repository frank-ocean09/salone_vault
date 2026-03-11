-- Automatic logging triggers for government actions

CREATE OR REPLACE FUNCTION log_gov_action()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'documents' AND NEW.issuer_id IS NOT NULL) THEN
        INSERT INTO activity_logs (user_id, action, document_id, meta)
        VALUES (NEW.issuer_id, 'document_issued', NEW.id, jsonb_build_object('recipient_id', NEW.user_id, 'type', NEW.type));
    
    ELSIF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'institution_shares') THEN
        INSERT INTO activity_logs (user_id, action, document_id, meta)
        VALUES (NEW.shared_by, 'institution_shared', NEW.document_id, jsonb_build_object('to_institution_id', NEW.to_institution_id, 'permission', NEW.permission));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers
DROP TRIGGER IF EXISTS tr_log_document_issuance ON documents;
CREATE TRIGGER tr_log_document_issuance
AFTER INSERT ON documents
FOR EACH ROW
EXECUTE FUNCTION log_gov_action();

DROP TRIGGER IF EXISTS tr_log_institution_share ON institution_shares;
CREATE TRIGGER tr_log_institution_share
AFTER INSERT ON institution_shares
FOR EACH ROW
EXECUTE FUNCTION log_gov_action();
