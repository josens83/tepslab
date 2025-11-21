{{/*
Expand the name of the chart.
*/}}
{{- define "tepslab.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "tepslab.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "tepslab.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "tepslab.labels" -}}
helm.sh/chart: {{ include "tepslab.chart" . }}
{{ include "tepslab.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "tepslab.selectorLabels" -}}
app.kubernetes.io/name: {{ include "tepslab.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
MongoDB labels
*/}}
{{- define "tepslab.mongodb.labels" -}}
{{ include "tepslab.labels" . }}
app: mongodb
tier: database
{{- end }}

{{/*
Redis labels
*/}}
{{- define "tepslab.redis.labels" -}}
{{ include "tepslab.labels" . }}
app: redis
tier: cache
{{- end }}

{{/*
Server labels
*/}}
{{- define "tepslab.server.labels" -}}
{{ include "tepslab.labels" . }}
app: server
tier: backend
{{- end }}

{{/*
Client labels
*/}}
{{- define "tepslab.client.labels" -}}
{{ include "tepslab.labels" . }}
app: client
tier: frontend
{{- end }}
