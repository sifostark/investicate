# -*- coding: utf-8 -*-
from flask import Flask, render_template, jsonify, request
import io
import json
import os
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

CASES_ROOT = os.path.join(app.root_path, 'data', 'cases')


def load_json(case_id, filename):
    case_dir = os.path.join(CASES_ROOT, case_id)

    # Basic protection against path traversal.
    if '/' in case_id or '\\' in case_id or '/' in filename or '\\' in filename:
        return None

    path = os.path.join(case_dir, filename)

    if not os.path.isfile(path):
        return None

    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None


def case_exists(case_id):
    if '/' in case_id or '\\' in case_id:
        return False
    return os.path.isdir(os.path.join(CASES_ROOT, case_id))


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/cases')
def list_cases():
    result = []

    if not os.path.isdir(CASES_ROOT):
        return jsonify(result)

    for name in sorted(os.listdir(CASES_ROOT)):
        if not case_exists(name):
            continue

        data = load_json(name, 'case.json')
        if data:
            # Never send solution data.
            result.append({
                'id': data.get('id', name),
                'title': data.get('title', name),
                'status': data.get('status', 'LOCKED'),
                'description': data.get('description', '')
            })

    return jsonify(result)


@app.route('/api/cases/<case_id>/case')
def get_case(case_id):
    data = load_json(case_id, 'case.json')
    if data is None:
        return jsonify({'error': 'Case not found'}), 404
    return jsonify(data)


@app.route('/api/cases/<case_id>/characters')
def get_characters(case_id):
    data = load_json(case_id, 'characters.json')
    if data is None:
        return jsonify({'error': 'Characters not found'}), 404
    return jsonify(data)


@app.route('/api/cases/<case_id>/evidence')
def get_evidence(case_id):
    data = load_json(case_id, 'evidence.json')
    if data is None:
        return jsonify({'error': 'Evidence not found'}), 404
    return jsonify(data)


@app.route('/api/cases/<case_id>/manifest')
def get_manifest(case_id):
    data = load_json(case_id, 'manifest.json')
    if data is None:
        return jsonify({'error': 'Manifest not found'}), 404
    return jsonify(data)


@app.route('/api/cases/<case_id>/submit', methods=['POST'])
def submit_conclusion(case_id):
    if not case_exists(case_id):
        return jsonify({'error': 'Case not found'}), 404

    payload = request.get_json(silent=True) or {}
    culprit = payload.get('culprit', '')
    evidence_ids = payload.get('evidence_ids', [])

    solution = load_json(case_id, 'solution.json')
    if solution is None:
        return jsonify({'error': 'Solution unavailable'}), 500

    correct_culprit = solution.get('culprit', '')
    required = solution.get('required_evidence', [])

    culprit_ok = culprit == correct_culprit

    evidence_ok = True
    for evidence_id in required:
        if evidence_id not in evidence_ids:
            evidence_ok = False
            break

    if culprit_ok and evidence_ok:
        return jsonify({
            'correct': True,
            'message': 'CONCLUSION ACCEPTED.',
            'case_id': case_id
        })

    return jsonify({
        'correct': False,
        'message': 'CONCLUSION REJECTED. THE EVIDENCE DOES NOT SUPPORT THIS CONCLUSION YET.'
    })


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
